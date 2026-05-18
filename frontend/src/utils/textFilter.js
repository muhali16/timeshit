/**
 * Parse wrap-up text (e.g. from Slack/Teams) into structured task list.
 *
 * @param {string} rawText - The raw pasted text
 * @param {object} filterSettings - textFilter settings object
 * @returns {object} { tasks: Array, output: string }
 */
export function parseWrapUpText(rawText, filterSettings) {
  if (!filterSettings?.enabled || !rawText?.trim()) {
    return { tasks: [], output: '' }
  }

  const lines = rawText.split('\n').map((l) => l.trim())
  const marker = filterSettings.taskMarker || '###'
  const tasks = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.startsWith(marker)) continue

    const taskText = line.slice(marker.length).trim()
    if (!taskText) continue

    // Collect subsequent non-marker lines as context for categorisation
    const subsequentLines = []
    for (let j = i + 1; j < lines.length; j++) {
      const nextLine = lines[j]
      if (nextLine.startsWith(marker)) break
      subsequentLines.push(nextLine)
    }
    const contextText = subsequentLines.join(' ').toLowerCase()

    // Determine category by keyword matching (first match wins)
    let matchedCategory = null
    for (const cat of filterSettings.categories) {
      if (cat.keywords.some((kw) => contextText.includes(kw.toLowerCase()))) {
        matchedCategory = cat
        break
      }
    }

    // Fallback to default category
    if (!matchedCategory) {
      matchedCategory =
        filterSettings.categories.find(
          (c) => c.name === filterSettings.defaultCategory
        ) ||
        filterSettings.categories[filterSettings.categories.length - 1]
    }

    const outputLine = matchedCategory.outputTemplate.replace('{task}', taskText)
    tasks.push({
      text: taskText,
      category: matchedCategory.name,
      display: matchedCategory.display,
      output: outputLine,
    })
  }

  const output = tasks.map((t) => t.output).join('\n')
  return { tasks, output }
}
