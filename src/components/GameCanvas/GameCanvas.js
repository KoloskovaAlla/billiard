import React, { useRef, useEffect, useState } from 'react';

export const GameCanvas = () => {
  const canvasRef = useRef(null);
  const [balls, setBalls] = useState([]);
  const [isBallClicked, setIsBallClicked] = useState(false); // Состояние для отслеживания того, кликнут ли шар

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const initialBalls = generateInitialBalls(canvas.width, canvas.height);
    setBalls(initialBalls);
  }, []);

  function generateInitialBalls(canvasWidth, canvasHeight) {
    const numberOfBalls = 10;
    const generatedBalls = [];
    for (let i = 0; i < numberOfBalls; i++) {
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      const radius = Math.random() * 20 + 10;
      const color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
      generatedBalls.push({ x, y, radius, color });
    }
    return generatedBalls;
  }

  function handleClick(event) {
    // Обработчик клика на холсте
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Проверяем, попал ли клик в какой-либо шар
    balls.forEach(ball => {
      const distance = Math.sqrt((mouseX - ball.x) ** 2 + (mouseY - ball.y) ** 2);
      if (distance <= ball.radius) {
        setIsBallClicked(true); // Устанавливаем состояние клика на шар
      }
    });
  }

  function drawBall(context, ball) {
    const { x, y, radius, color } = ball;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
    context.closePath();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height); // Очищаем холст перед рисованием

    balls.forEach(ball => drawBall(context, ball));

    // Добавляем обработчик клика на холсте
    canvas.addEventListener('click', handleClick);

    return () => {
      // Убираем обработчик клика при размонтировании компонента
      canvas.removeEventListener('click', handleClick);
    };
  }, [balls]); // Зависимость от состояния balls

  return <canvas ref={canvasRef} width={800} height={600} />;
};
