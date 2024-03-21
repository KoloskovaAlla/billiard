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
    // Добавляем начальные скорости в пределах [-2, 2] для примера
    const vx = (Math.random() - 0.5) * 4;
    const vy = (Math.random() - 0.5) * 4;
    generatedBalls.push({ x, y, radius, color, vx, vy });
  }
  return generatedBalls;
};

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

    // Проверка коллизий
    if (checkCollisionWithBounds(updatedBalls[draggedBallIndex])) {
      // Обработка коллизии
    }

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

  // столкнулись ли шары между собой?
  const checkCollision = (ball1, ball2) => {
    const dx = ball1.x - ball2.x;
    const dy = ball1.y - ball2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (ball1.radius + ball2.radius);
  };

  // столкнулись ли шары с границами холста
  const checkCollisionWithBounds = (ball) => {
  const { x, y, radius } = ball;
  const canvas = canvasRef.current;
  if (!canvas) return;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  if (x - radius < 0 || x + radius > canvasWidth || y - radius < 0 || y + radius > canvasHeight) {
    return true;
  };

  return false;
  };

const calculateNewVelocities = (ball1, ball2, canvasWidth, canvasHeight) => {
  if (ball2 === null) {
    // Столкновение с границей холста
    const newVx = -ball1.vx; // Скорость после столкновения противоположна скорости до столкновения
    const newVy = -ball1.vy;
    return { x: newVx, y: newVy };
  } else {
    // Столкновение двух шаров
    const m1 = ball1.radius ** 2; // Простейшее приближение массы через площадь шара
    const m2 = ball2.radius ** 2;

    const v1 = Math.sqrt(ball1.vx ** 2 + ball1.vy ** 2);
    const v2 = Math.sqrt(ball2.vx ** 2 + ball2.vy ** 2);

    const theta1 = Math.atan2(ball1.vy, ball1.vx);
    const theta2 = Math.atan2(ball2.vy, ball2.vx);

    const phi = Math.atan2(ball2.y - ball1.y, ball2.x - ball1.x);

    const v1x = v1 * Math.cos(theta1 - phi);
    const v1y = v1 * Math.sin(theta1 - phi);
    const v2x = v2 * Math.cos(theta2 - phi);
    const v2y = v2 * Math.sin(theta2 - phi);

    const newV1x = ((m1 - m2) * v1x + (m2 + m2) * v2x) / (m1 + m2);
    const newV1y = v1y;
    const newV2x = ((m1 + m1) * v1x + (m2 - m1) * v2x) / (m1 + m2);
    const newV2y = v2y;

    const newV1 = {
      x: Math.cos(phi) * newV1x + Math.cos(phi + Math.PI / 2) * newV1y,
      y: Math.sin(phi) * newV1x + Math.sin(phi + Math.PI / 2) * newV1y
    };

    const newV2 = {
      x: Math.cos(phi) * newV2x + Math.cos(phi + Math.PI / 2) * newV2y,
      y: Math.sin(phi) * newV2x + Math.sin(phi + Math.PI / 2) * newV2y
    };

    return [newV1, newV2];
  }
  }; 
  
const updateBallVelocities = () => {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      if (checkCollision(balls[i], balls[j])) {
        const [newV1, newV2] = calculateNewVelocities(balls[i], balls[j]);
        balls[i].vx = newV1.x;
        balls[i].vy = newV1.y;
        balls[j].vx = newV2.x;
        balls[j].vy = newV2.y;
      }
    }
  }
  
};

const updateBallPositions = () => {
  setBalls(prevBalls => {
    return prevBalls.map(ball => {
      const newX = ball.x + ball.vx;
      const newY = ball.y + ball.vy;

      // Проверка столкновений с границами холста
      if (newX - ball.radius < 0 || newX + ball.radius > canvasRef.current.width) {
        ball.vx *= -1; // Изменяем направление скорости по оси X
      }
      if (newY - ball.radius < 0 || newY + ball.radius > canvasRef.current.height) {
        ball.vy *= -1; // Изменяем направление скорости по оси Y
      }

      // Обновляем положение шара
      return { ...ball, x: newX, y: newY };
    });
  });  
};


useEffect(() => { 
  updateBallPositions();
}, [balls]);

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
