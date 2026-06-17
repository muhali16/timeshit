const readline = require('readline');

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: process.stdin.isTTY,
  });
}

function question(rl, prompt) {
  return new Promise((resolve, reject) => {
    try {
      rl.question(prompt, (answer) => {
        resolve(answer);
      });

      // Handle close event
      rl.once('close', () => {
        reject(new Error('Input closed'));
      });
    } catch (err) {
      reject(err);
    }
  });
}

async function getUserSelection(client) {
  console.log('\n📋 Database User Selection\n');

  // Check if user specified a user ID via environment variable or args
  const envUserId = process.env.SEED_USER_ID;
  const argUserId = process.argv.find((arg) => arg.startsWith('--user-id='))?.split('=')[1];

  if (envUserId || argUserId) {
    const userId = envUserId || argUserId;
    console.log(`Using user ID from ${envUserId ? 'SEED_USER_ID env' : 'CLI args'}: ${userId}\n`);
    return userId;
  }

  // Get existing users
  const userResult = await client.query(
    `SELECT id, email, name FROM users ORDER BY created_at DESC LIMIT 10`
  );

  // If not TTY, provide usage instructions
  if (!process.stdin.isTTY) {
    console.log('Non-interactive mode detected. Please specify a user:');
    console.log('\nOption 1 - Use environment variable:');
    console.log('  SEED_USER_ID=<user-id> npm run db:seed:3months\n');
    console.log('Option 2 - Use CLI argument:');
    console.log('  npm run db:seed:3months -- --user-id=<user-id>\n');
    console.log('Available users:');

    userResult.rows.forEach((user) => {
      console.log(`  ${user.id} - ${user.email} (${user.name || 'No name'})`);
    });

    process.exit(1);
  }

  const rl = createReadlineInterface();

  try {
    if (userResult.rows.length > 0) {
      console.log('Existing users:');
      userResult.rows.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.name || 'No name'})`);
      });

      const choice = await question(
        rl,
        '\nSelect user number (or press Enter to create new): '
      );

      const choiceNum = parseInt(choice);
      if (!isNaN(choiceNum) && choiceNum > 0 && choiceNum <= userResult.rows.length) {
        const selectedUser = userResult.rows[choiceNum - 1];
        console.log(`\n✓ Selected: ${selectedUser.email}\n`);
        rl.close();
        return selectedUser.id;
      }
    }

    // Create new user
    console.log('\nCreating new user...');
    const email = await question(rl, 'Email: ');
    const name = await question(rl, 'Name (optional): ');

    const createResult = await client.query(
      `INSERT INTO users (email, name, timezone)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET name = COALESCE(EXCLUDED.name, users.name)
       RETURNING id, email`,
      [email, name || null, 'Asia/Jakarta']
    );

    const newUser = createResult.rows[0];
    console.log(`\n✓ Created: ${newUser.email}\n`);
    rl.close();
    return newUser.id;
  } catch (err) {
    try {
      rl.close();
    } catch (e) {
      // ignore
    }
    throw err;
  }
}

module.exports = {
  getUserSelection,
};
