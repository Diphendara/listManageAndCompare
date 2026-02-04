import React from 'react';
import renderer from 'react-test-renderer';
import { TextInput } from 'react-native';
import { SearchBar } from '../../src/components/SearchBar';

describe('SearchBar component', () => {
  it('renders text input', () => {
    const tree = renderer.create(
      <SearchBar value="" onChange={() => {}} placeholder="Search..." />
    );
    const root = tree.root;
    expect(root.findByType(TextInput)).toBeDefined();
  });

  it('calls onChange when text is entered', () => {
    const onChange = jest.fn();
    const tree = renderer.create(
      <SearchBar value="" onChange={onChange} placeholder="Search..." />
    );
    const root = tree.root;
    const input = root.findByType(TextInput);
    
    input.props.onChangeText('test query');
    expect(onChange).toHaveBeenCalledWith('test query');
  });

  it('displays current value', () => {
    const tree = renderer.create(
      <SearchBar value="existing query" onChange={() => {}} placeholder="Search..." />
    );
    const root = tree.root;
    const input = root.findByType(TextInput);
    expect(input.props.value).toBe('existing query');
  });
});
