import { expect, test } from 'vitest';
import { render } from '@testing-library/react';
import RabbitholeChatGalleryExplore from './RabbitholeChatGalleryExplore';

test('rabbithole.chat Gallery Explore renders correctly', () => {
    const { container } = render(<RabbitholeChatGalleryExplore />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
});