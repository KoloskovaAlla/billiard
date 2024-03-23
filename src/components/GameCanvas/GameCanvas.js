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
    // if (!isDragging || draggedBallIndex === null) return;

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
  if (draggedBallIndex !== null) {
    updatedBalls[draggedBallIndex].x += dx;
    updatedBalls[draggedBallIndex].y += dy;
  }
  return updatedBalls;
});
  };

  const handleCanvasMouseUp = () => {
    // setIsDragging(false);
    // setDraggedBallIndex(null);
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

    return distance < ball1.radius + ball2.radius;
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

  // useEffect(() => {
  //   let collisionDetected = false; // Переменная для отслеживания столкновений

  //   // Проверка коллизий между всеми парами шаров
  //   for (let i = 0; i < balls.length; i++) {
  //     for (let j = i + 1; j < balls.length; j++) {
  //       if (checkCollision(balls, i, j)) {
  //         collisionDetected = true; // Если столкновение обнаружено, устанавливаем переменную в true
  //       }
  //     }
  //   }

  //   setIsCollision(collisionDetected); // Устанавливаем состояние isCollision в зависимости от обнаруженных столкновений
  // }, [balls]);

  // useEffect(() => {
  //   // Проверка коллизий между всеми парами шаров
  //   for (let i = 0; i < balls.length; i++) {
  //     for (let j = i + 1; j < balls.length; j++) {
  //       return checkCollision(balls, i, j); // Передаем в функцию checkCollision массив balls
  //     }
  //   }
  // }, [balls]);
const updateBallPositions = () => {
  setBalls(prevBalls => {
    let updatedBalls = [...prevBalls];
    for (let i = 0; i < updatedBalls.length; i++) {
      // Обновляем позицию только если шар не перетаскивается мышью
      if (!isDragging || i !== draggedBallIndex) {
        updatedBalls[i].x += updatedBalls[i].vx;
        updatedBalls[i].y += updatedBalls[i].vy;

        // Проверяем столкновения с границами холста
        if (
          canvasRef.current?.width &&
          canvasRef.current?.height &&
          (updatedBalls[i].x - updatedBalls[i].radius < 0 || updatedBalls[i].x + updatedBalls[i].radius > canvasRef.current.width) ||
          (updatedBalls[i].y - updatedBalls[i].radius < 0 || updatedBalls[i].y + updatedBalls[i].radius > canvasRef.current.height)
        ) {
          updatedBalls[i].vx *= -1; // Изменяем направление скорости по оси X
          updatedBalls[i].vy *= -1; // Изменяем направление скорости по оси Y
        }
      }
    }
    return updatedBalls;
  });
};
useEffect(() => {
  if(!collisionDetected) return;
  const animationFrame = requestAnimationFrame(updateBallPositions);
  return () => cancelAnimationFrame(animationFrame);
}, [balls]);

  const [collidingBalls, setCollidingBalls] = useState([]);

  // useEffect для обнаружения столкновений
  const [collisionDetected, setCollisionDetected] = useState(false);
  const [processedCollision, setProcessedCollision] = useState(false);

  useEffect(() => {
    console.log()
    let collidingPairs = [];
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        if (checkCollision(balls, i, j)) {
          setCollisionDetected(true);
          setCollidingBalls([balls[i], balls[j]]);
          return;
        }
      }
    }
    setCollisionDetected(false);
  }, [balls]);

  useEffect(() => {
    if (collisionDetected && !processedCollision) {
      console.log('Обновляем шары');
      const [ball1, ball2] = collidingBalls;

  setBalls(prevBalls => {
    let updatedBalls = [...prevBalls];

    // Вычисляем направление столкновения
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const normalX = dx / distance;
    const normalY = dy / distance;

    // Вычисляем проекции скоростей на вектор нормали
    const v1n = normalX * ball1.vx + normalY * ball1.vy;
    const v2n = normalX * ball2.vx + normalY * ball2.vy;

    // Вычисляем новые скорости после столкновения (упругое соударение)
    const m1 = ball1.radius * ball1.radius * Math.PI; // Масса шара 1 (пропорциональна площади)
    const m2 = ball2.radius * ball2.radius * Math.PI; // Масса шара 2 (пропорциональна площади)
    const v1nAfter = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
    const v2nAfter = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);

    // Обновляем скорости шаров
    ball1.vx += (v1nAfter - v1n) * normalX;
    ball1.vy += (v1nAfter - v1n) * normalY;
    ball2.vx += (v2nAfter - v2n) * normalX;
    ball2.vy += (v2nAfter - v2n) * normalY;

    console.log('Обновляем шары после столкновения');
    return updatedBalls;
  });
      console.log('Обработали столкновение');
      setProcessedCollision(true);
    } else if (!collisionDetected && processedCollision) {
      // Сбрасываем флаг обработанного столкновения, если столкновение больше не обнаружено
      setProcessedCollision(false);
    }
  }, [collisionDetected, processedCollision]);

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
