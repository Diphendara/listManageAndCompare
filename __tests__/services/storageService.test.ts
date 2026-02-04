import { createStorageService } from '../../src/services/storageService';
import { createInMemoryAdapter } from '../../src/services/inMemoryStorage';

describe('StorageService', () => {
  let storageService: ReturnType<typeof createStorageService>;
  let adapter: ReturnType<typeof createInMemoryAdapter>;

  beforeEach(() => {
    adapter = createInMemoryAdapter();
    storageService = createStorageService(adapter, '');
  });

  it('saves and loads JSON objects', async () => {
    const data = { name: 'Test', value: 42 };
    const filePath = 'test.json';

    await storageService.writeJson(filePath, data);
    const loaded = await storageService.readJson(filePath);

    expect(loaded).toEqual(data);
  });

  it('throws error when loading non-existent file', async () => {
    await expect(storageService.readJson('nonexistent.json')).rejects.toThrow();
  });

  it('handles empty objects', async () => {
    const data = {};
    await storageService.writeJson('empty.json', data);
    const loaded = await storageService.readJson('empty.json');

    expect(loaded).toEqual({});
  });

  it('handles arrays', async () => {
    const data = [1, 2, 3, { name: 'test' }];
    await storageService.writeJson('array.json', data);
    const loaded = await storageService.readJson('array.json');

    expect(loaded).toEqual(data);
  });
});
