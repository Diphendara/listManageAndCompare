import { createInMemoryAdapter } from '../../src/services/inMemoryStorage';

describe('InMemoryStorageAdapter', () => {
  let adapter: ReturnType<typeof createInMemoryAdapter>;

  beforeEach(() => {
    adapter = createInMemoryAdapter();
  });

  it('saves and reads files', async () => {
    const filePath = 'test.json';
    const content = JSON.stringify({ name: 'Test', value: 42 });

    await adapter.writeFile(filePath, content);
    const readContent = await adapter.readFile(filePath);

    expect(readContent).toBe(content);
  });

  it('overwrites existing files', async () => {
    const filePath = 'test.json';
    await adapter.writeFile(filePath, 'first content');
    await adapter.writeFile(filePath, 'second content');

    const content = await adapter.readFile(filePath);
    expect(content).toBe('second content');
  });

  it('throws error when reading non-existent file', async () => {
    await expect(adapter.readFile('nonexistent.json')).rejects.toThrow();
  });

  it('renames files', async () => {
    await adapter.writeFile('original.json', 'content');
    await adapter.rename('original.json', 'renamed.json');

    const content = await adapter.readFile('renamed.json');
    expect(content).toBe('content');
  });

  it('handles directory paths', async () => {
    const filePath = 'dir/subdir/file.json';
    await adapter.writeFile(filePath, 'nested content');
    const content = await adapter.readFile(filePath);

    expect(content).toBe('nested content');
  });
});
