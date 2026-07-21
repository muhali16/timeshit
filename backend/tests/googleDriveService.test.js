const mockWhere = jest.fn().mockResolvedValue(undefined);
const mockSet = jest.fn(() => ({ where: mockWhere }));

jest.mock('../src/database/connection', () => ({
  db: { update: jest.fn(() => ({ set: mockSet })) },
}));

const driveService = require('../src/services/googleDriveService');

const apiError = (code) => Object.assign(new Error(`HTTP ${code}`), { code });

const fakeDrive = ({ get, create } = {}) => ({
  files: {
    get: get || jest.fn(),
    create: create || jest.fn().mockResolvedValue({ data: { id: 'new-folder' } }),
  },
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getOrCreateRootFolder', () => {
  it('reuses a stored folder that is still reachable', async () => {
    const drive = fakeDrive({
      get: jest.fn().mockResolvedValue({ data: { trashed: false } }),
    });

    const id = await driveService.getOrCreateRootFolder(drive, 1, 'stored-folder');

    expect(id).toBe('stored-folder');
    expect(drive.files.create).not.toHaveBeenCalled();
  });

  // The migration case: folder ids saved under the old full-`drive` scope are
  // invisible to `drive.file`, so Google answers 404 and we must self-heal.
  it.each([404, 403])('recreates when the stored folder returns %i', async (code) => {
    const drive = fakeDrive({ get: jest.fn().mockRejectedValue(apiError(code)) });

    const id = await driveService.getOrCreateRootFolder(drive, 1, 'stale-folder');

    expect(id).toBe('new-folder');
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ googleDriveFolderId: 'new-folder' })
    );
  });

  it('recreates when the stored folder is in the trash', async () => {
    const drive = fakeDrive({
      get: jest.fn().mockResolvedValue({ data: { trashed: true } }),
    });

    expect(await driveService.getOrCreateRootFolder(drive, 1, 'trashed-folder')).toBe(
      'new-folder'
    );
  });

  it('creates a folder at My Drive root when nothing is stored', async () => {
    const drive = fakeDrive();

    const id = await driveService.getOrCreateRootFolder(drive, 1, null);

    expect(id).toBe('new-folder');
    expect(drive.files.get).not.toHaveBeenCalled();
    expect(drive.files.create).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: expect.not.objectContaining({ parents: expect.anything() }),
      })
    );
  });

  it('rethrows unexpected Drive errors instead of orphaning the folder', async () => {
    const drive = fakeDrive({ get: jest.fn().mockRejectedValue(apiError(500)) });

    await expect(
      driveService.getOrCreateRootFolder(drive, 1, 'stored-folder')
    ).rejects.toThrow('HTTP 500');
    expect(drive.files.create).not.toHaveBeenCalled();
  });
});
