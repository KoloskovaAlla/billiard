import { useRef, useEffect, useState } from 'react';
import { Ball } from '../Ball/Ball';

export const GameCanvas = () => {
  const canvasRef = useRef(null);
  const [balls, setBalls] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const animate = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      balls.forEach(ball => ball.draw(context));
      requestAnimationFrame(animate);
    };
    animate();

    const handleClick = event => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const radius = Math.random() * 20 + 10;
      const color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
      const newBall = Ball({ x, y, radius, color });
      setBalls(prevBalls => [...prevBalls, newBall]);
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [balls]);

  return <canvas ref={canvasRef} width={800} height={600} />;
};
