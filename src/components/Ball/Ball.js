export const Ball = ({ x, y, radius, color }) => {
  const draw = context => {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
    context.closePath();
  };

  return { draw };
};
