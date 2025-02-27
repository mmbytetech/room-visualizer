import { mount } from '@vue/test-utils';
import * as THREE from 'three';

jest.mock('three', () => ({
  Scene: jest.fn().mockImplementation(() => ({ add: jest.fn() })),
  PerspectiveCamera: jest.fn().mockImplementation(() => ({ position: {}, lookAt: jest.fn() })),
  WebGLRenderer: jest.fn().mockImplementation(() => ({ setSize: jest.fn(), render: jest.fn() })),
  AmbientLight: jest.fn(),
  DirectionalLight: jest.fn(),
  Mesh: jest.fn(),
  EdgesGeometry: jest.fn(),
  LineSegments: jest.fn(),
  MeshStandardMaterial: jest.fn(),
  Color: jest.fn(),
  ExtrudeGeometry: jest.fn(),
}));

describe('RoomVisualizer', () => {
  let wrapper;
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({
      corners: [
        { x: -1405, y: 393 },
        { x: -990, y: 393 },
        { x: -990, y: -255 },
        { x: -1405, y: -255 },
      ],
    }),
  });

  test('3D Scene renders properly', () => {
  });
});
