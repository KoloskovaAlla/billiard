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
      const mass = Math.PI * radius * radius; // Масса пропорциональна площади круга
      const vx = (Math.random() - 0.5) * 10; // Случайная скорость по оси X в диапазоне от -5 до 5
      const vy = (Math.random() - 0.5) * 10; // Случайная скорость по оси Y в диапазоне от -5 до 5
      generatedBalls.push({ x, y, radius, color, mass, vx, vy });
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

  const handleCollisions = () => {
    const updatedBalls = [...balls]; // Создаем копию массива шаров

    for (let i = 0; i < updatedBalls.length; i++) {
      for (let j = i + 1; j < updatedBalls.length; j++) {
        const ballA = updatedBalls[i];
        const ballB = updatedBalls[j];

        // Рассчитываем расстояние между центрами шаров
        const dx = ballB.x - ballA.x;
        const dy = ballB.y - ballA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Проверяем, происходит ли столкновение
        if (distance < ballA.radius + ballB.radius) {
          // Если происходит, меняем направление движения шаров
          const angle = Math.atan2(dy, dx);
          const speedA = Math.sqrt(ballA.vx * ballA.vx + ballA.vy * ballA.vy);
          const speedB = Math.sqrt(ballB.vx * ballB.vx + ballB.vy * ballB.vy);
          const directionA = Math.atan2(ballA.vy, ballA.vx);
          const directionB = Math.atan2(ballB.vy, ballB.vx);

          // Рассчитываем новые скорости шаров после столкновения
          const newVxA = speedA * Math.cos(directionA - angle);
          const newVyA = speedA * Math.sin(directionA - angle);
          const newVxB = speedB * Math.cos(directionB - angle);
          const newVyB = speedB * Math.sin(directionB - angle);

          const finalVxA = ((ballA.mass - ballB.mass) * newVxA + (ballB.mass + ballB.mass) * newVxB) / (ballA.mass + ballB.mass);
          const finalVxB = ((ballA.mass + ballA.mass) * newVxA + (ballB.mass - ballA.mass) * newVxB) / (ballA.mass + ballB.mass);

          const finalVyA = newVyA;
          const finalVyB = newVyB;

          // Обновляем скорости шаров
          ballA.vx = Math.cos(angle) * finalVxA + Math.cos(angle + Math.PI / 2) * finalVyA;
          ballA.vy = Math.sin(angle) * finalVxA + Math.sin(angle + Math.PI / 2) * finalVyA;
          ballB.vx = Math.cos(angle) * finalVxB + Math.cos(angle + Math.PI / 2) * finalVyB;
          ballB.vy = Math.sin(angle) * finalVxB + Math.sin(angle + Math.PI / 2) * finalVyB;
        }
      }
    }

    return updatedBalls;
  };

  const updateBallPositions = () => {
    setBalls(prevBalls => {
      return prevBalls.map(ball => {
        return {
          ...ball,
          x: ball.x + ball.vx,
          y: ball.y + ball.vy
        };
      });
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const animationFrameId = requestAnimationFrame(() => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      const updatedBalls = handleCollisions(); // Обработка столкновений
      updatedBalls.forEach(ball => drawBall(context, ball)); // Отрисовка шаров после столкновений
      updateBallPositions(); // Обновление позиций шаров
    });

    return () => cancelAnimationFrame(animationFrameId);
  }, [balls]);

  return <canvas ref={canvasRef} width={800} height={600} />;
};