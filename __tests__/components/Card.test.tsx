import React from 'react';
import renderer from 'react-test-renderer';
import { Card } from '../../src/components/Card';
import { Text } from 'react-native';

describe('Card component', () => {
  it('renders children correctly', () => {
    const tree = renderer.create(
      <Card>
        <Text>Card Content</Text>
      </Card>
    );
    const root = tree.root;
    const textElement = root.findByType(Text);
    expect(textElement.props.children).toBe('Card Content');
  });

  it('renders multiple children', () => {
    const tree = renderer.create(
      <Card>
        <Text>First</Text>
        <Text>Second</Text>
      </Card>
    );
    const root = tree.root;
    const texts = root.findAllByType(Text);
    expect(texts.length).toBeGreaterThanOrEqual(2);
  });
});
