import React, { useRef, useEffect, useState } from 'react';

export const GameCanvas = () => {
  const canvasRef = useRef(null);
  const [balls, setBalls] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedBallIndex, setDraggedBallIndex] = useState(null);
  const [prevMousePosition, setPrevMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const initialBalls = generateInitialBalls(canvas.width, canvas.height);
    setBalls(initialBalls);
  }, []);

  const generateInitialBalls = (canvasWidth, canvasHeight) => {
    const numberOfBalls = 10;
    const generatedBalls = [];
    for (let index = 0; index < numberOfBalls; index++) {
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      const radius = Math.random() * 20 + 10;
      const color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
      generatedBalls.push({ x, y, radius, color });
    }
    return generatedBalls;
  }

  const handleCanvasMouseDown = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    balls.forEach((ball, index) => {
      const distance = Math.sqrt((mouseX - ball.x) ** 2 + (mouseY - ball.y) ** 2);
      if (distance <= ball.radius) {
        setIsDragging(true);
        setDraggedBallIndex(index);
        setPrevMousePosition({ x: mouseX, y: mouseY });
      }
    });
  };

  const handleCanvasMouseMove = (event) => {
    if (!isDragging || draggedBallIndex === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const dx = mouseX - prevMousePosition.x;
    const dy = mouseY - prevMousePosition.y;

    setPrevMousePosition({ x: mouseX, y: mouseY });

    setBalls(prevBalls => {
      const updatedBalls = [...prevBalls];
      updatedBalls[draggedBallIndex].x += dx;
      updatedBalls[draggedBallIndex].y += dy;
      return updatedBalls;
    });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDraggedBallIndex(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleCanvasMouseDown);
      canvas.removeEventListener('mousemove', handleCanvasMouseMove);
      canvas.removeEventListener('mouseup', handleCanvasMouseUp);
    };
  }, [balls, isDragging, draggedBallIndex]);

  const drawBall = (context, ball) => {
    const { x, y, radius, color } = ball;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
    context.closePath();
  };

  // столкнулись ли шары?
  const checkCollision = (ball1, ball2) => {
    const dx = ball1.x - ball2.x;
    const dy = ball1.y - ball2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (ball1.radius + ball2.radius);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    balls.forEach(ball => drawBall(context, ball));
  }, [balls]);

  return <canvas ref={canvasRef} width={800} height={600} />;
};
