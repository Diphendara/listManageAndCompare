import { createInventoryService } from '../../src/services/inventoryService';
import { createStorageService } from '../../src/services/storageService';
import { createInMemoryAdapter } from '../../src/services/inMemoryStorage';
import type { Inventory } from '../../src/models/Inventory';

describe('InventoryService', () => {
  let inventoryService: ReturnType<typeof createInventoryService>;
  let storageService: ReturnType<typeof createStorageService>;
  let adapter: ReturnType<typeof createInMemoryAdapter>;

  beforeEach(() => {
    adapter = createInMemoryAdapter();
    storageService = createStorageService(adapter, '');
    inventoryService = createInventoryService(storageService);
  });

  it('saves and loads inventory', async () => {
    const inventory: Inventory = [
      { quantity: 5, name: 'Sword', tag: undefined },
      { quantity: 3, name: 'Shield', tag: 'defense' },
    ];

    await inventoryService.saveInventory(inventory);
    const loaded = await inventoryService.loadInventory();

    expect(loaded).toEqual(inventory);
  });

  it('returns empty inventory for new app', async () => {
    const inventory = await inventoryService.loadInventory();
    expect(inventory).toEqual([]);
  });

  it('persists inventory across multiple saves', async () => {
    const inv1: Inventory = [{ quantity: 5, name: 'Sword', tag: undefined }];
    await inventoryService.saveInventory(inv1);

    const inv2: Inventory = [
      { quantity: 5, name: 'Sword', tag: undefined },
      { quantity: 3, name: 'Shield', tag: undefined },
    ];
    await inventoryService.saveInventory(inv2);

    const loaded = await inventoryService.loadInventory();
    expect(loaded.length).toBe(2);
  });

  it('handles inventory with multiple items and tags', async () => {
    const inventory: Inventory = [
      { quantity: 10, name: 'Gold Coin', tag: 'currency' },
      { quantity: 5, name: 'Health Potion', tag: 'healing' },
      { quantity: 2, name: 'Damage Potion', tag: 'damage' },
      { quantity: 1, name: 'Legendary Sword', tag: 'weapon' },
    ];

    await inventoryService.saveInventory(inventory);
    const loaded = await inventoryService.loadInventory();

    expect(loaded.length).toBe(4);
    expect(loaded).toEqual(inventory);
  });
});
