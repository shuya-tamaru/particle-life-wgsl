# Particle Life - WebGPU/WGSL

[![日本語版](https://img.shields.io/badge/日本語版-README.ja.md-blue)](README.ja.md)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-デモページ-brightgreen)](https://www.styublog.com/shader/particle-life)
[![YouTube](https://img.shields.io/badge/YouTube-動画解説-red)](https://youtu.be/wZq1vvrw90Y?si=yvt6Re6rliepYDJV)

[![Particle Life Demo](thumbnail.jpg)](https://youtu.be/wZq1vvrw90Y?si=yvt6Re6rliepYDJV)

A Particle Life simulation implemented using WebGPU and WGSL (WebGPU Shading Language). Multiple particle types interact with each other to generate complex and beautiful patterns.

## Overview

Particle Life is a simulation where different types of particles exert forces on each other, creating complex life-like behavioral patterns. This implementation uses WebGPU compute shaders to perform high-speed calculations on the GPU, generating beautiful real-time animations.

## Features

- **WebGPU Support**: High-performance GPU computing using the latest WebGPU API
- **WGSL Shaders**: Custom shaders written in WebGPU Shading Language
- **Real-time Simulation**: Real-time calculation of thousands of particles
- **Interactive**: Mouse controls and parameter adjustment capabilities
- **Beautiful Visuals**: Glow effects and color palette for visual expression

## Tech Stack

- **WebGPU**: GPU computing and rendering
- **WGSL**: Shader programming
- **TypeScript**: Main application
- **Vite**: Build tool
- **lil-gui**: Parameter adjustment UI

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## Project Structure

```
src/
├── shaders/           # WGSL shader files
│   ├── particle.wgsl     # Particle rendering
│   ├── forceAccumulation.wgsl  # Force calculation
│   └── integrate.wgsl    # Position/velocity updates
├── compute/           # Compute shader management
├── gfx/              # Graphics related
├── utils/            # Utilities
└── core/             # Core systems
```

## Demo

- **Live Demo**: [https://www.styublog.com/shader/particle-life](https://www.styublog.com/shader/particle-life)
- **Video Explanation**: [YouTube](https://youtu.be/wZq1vvrw90Y?si=yvt6Re6rliepYDJV)

## License

MIT License
