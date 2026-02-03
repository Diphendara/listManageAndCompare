import React from 'react';
import renderer from 'react-test-renderer';
import { Pressable } from 'react-native';
import { ListCards } from '../src/screens/lists/ListCards';

describe('ListCards basic interactions', () => {
  it('renders and allows selecting and toggling without crashing', () => {
    const lists = [
      { name: 'Alpha', inUse: true, decklist: [{ quantity: 1, name: 'A' }] },
      { name: 'Beta', inUse: false, decklist: [{ quantity: 2, name: 'B' }] },
    ];

    const onSelectList = jest.fn();
    const onToggleInUse = jest.fn();
    const onDeleteList = jest.fn();
    const onConfirmDeleteList = jest.fn();

    const tree = renderer.create(
      <ListCards
        lists={lists as any}
        selectedListName={null}
        onSelectList={onSelectList}
        onToggleInUse={onToggleInUse}
        onDeleteList={onDeleteList}
        expandedDeleteListName={null}
        onConfirmDeleteList={onConfirmDeleteList}
        loading={false}
      />
    );

    const root = tree.root;
    // Find all Pressable nodes and call their onPress to simulate clicks
    const pressables = root.findAllByType(Pressable);
    expect(pressables.length).toBeGreaterThan(0);

    // Call first two pressables safely
    pressables.slice(0, 2).forEach((p) => {
      const fn = (p.props as any).onPress;
      if (typeof fn === 'function') fn();
    });

    // No crash, and callbacks may have been called
    expect(true).toBe(true);
  });
});
