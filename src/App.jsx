import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Stack } from './components/Stack';
import { Experience } from './components/Experience';
import { Projects } from './components/Projects';
import { Education } from './components/Education';
import { Contact } from './components/Contact';
import { useScrollReveal } from './hooks/useScrollReveal';

export function App() {
  // Initialize scroll animations
  useScrollReveal();

  return (
    <div className="app-container" id="top">
      <Header />
      <main>
        <Hero />
        <About />
        <Stack />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>
    </div>
  );
}

export default App;
