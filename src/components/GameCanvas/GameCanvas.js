import React, { useRef, useEffect, useState } from 'react';

export const GameCanvas = () => {
  const canvasRef = useRef(null);
  const [balls, setBalls] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isCollision, setIsCollision] = useState(false);
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
    const numberOfBalls = 3;
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
  const checkCollision = (balls, index1, index2) => {
    const ball1 = balls[index1];
    const ball2 = balls[index2];
    const dx = ball1.x - ball2.x;
    const dy = ball1.y - ball2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < ball1.radius + ball2.radius) {
      // Рассчитываем новые скорости только для столкнувшихся шаров
      const angle = Math.atan2(dy, dx);
      const magnitude1 = Math.sqrt(ball1.vx * ball1.vx + ball1.vy * ball1.vy);
      const magnitude2 = Math.sqrt(ball2.vx * ball2.vx + ball2.vy * ball2.vy);
      const direction1 = Math.atan2(ball1.vy, ball1.vx);
      const direction2 = Math.atan2(ball2.vy, ball2.vx);

      const newVx1 = magnitude1 * Math.cos(direction1 - angle);
      const newVy1 = magnitude1 * Math.sin(direction1 - angle);
      const newVx2 = magnitude2 * Math.cos(direction2 - angle);
      const newVy2 = magnitude2 * Math.sin(direction2 - angle);

      // Устанавливаем новые скорости для столкнувшихся шаров
      const updatedBalls = [...balls];
      updatedBalls[index1].vx = newVx2 * Math.cos(angle) + newVx1 * Math.cos(angle + Math.PI / 2);
      updatedBalls[index1].vy = newVy1 * Math.sin(angle) + newVy2 * Math.sin(angle + Math.PI / 2);
      updatedBalls[index2].vx = newVx1 * Math.cos(angle) + newVx2 * Math.cos(angle + Math.PI / 2);
      updatedBalls[index2].vy = newVy2 * Math.sin(angle) + newVy1 * Math.sin(angle + Math.PI / 2);

      return updatedBalls; // Возвращаем массив с обновленными скоростями шаров
    }

    return balls; // Если столкновение не произошло, возвращаем исходный массив шаров
  };

  // const updateBallPositions = () => {
  //   setBalls(prevBalls => {
  //     let updatedBalls = [...prevBalls];
  //     for (let i = 0; i < updatedBalls.length; i++) {
  //       for (let j = i + 1; j < updatedBalls.length; j++) {
  //         updatedBalls = checkCollision(updatedBalls, i, j);
  //       }
  //     }

  //     // Теперь обновляем позиции всех шаров с учетом возможных изменений скоростей
  //     updatedBalls = updatedBalls.map(ball => {
  //       const newX = ball.x + ball.vx;
  //       const newY = ball.y + ball.vy;

  //       // Проверяем столкновения с границами холста
  //       if (newX - ball.radius < 0 || newX + ball.radius > canvasRef.current.width) {
  //         ball.vx *= -1; // Изменяем направление скорости по оси X
  //       }
  //       if (newY - ball.radius < 0 || newY + ball.radius > canvasRef.current.height) {
  //         ball.vy *= -1; // Изменяем направление скорости по оси Y
  //       }

  //       return { ...ball, x: newX, y: newY };
  //     });

  //     return updatedBalls;
  //   });
  // };

  useEffect(() => {
    let collisionDetected = false; // Переменная для отслеживания столкновений

    // Проверка коллизий между всеми парами шаров
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        if (checkCollision(balls[i], balls[j])) {
          collisionDetected = true; // Если столкновение обнаружено, устанавливаем переменную в true
        }
      }
    }

    setIsCollision(collisionDetected); // Устанавливаем состояние isCollision в зависимости от обнаруженных столкновений
  }, [balls]);

useEffect(() => {
  // Проверка коллизий между всеми парами шаров
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      return checkCollision(balls, i, j); // Передаем в функцию checkCollision массив balls
    }
  }
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
