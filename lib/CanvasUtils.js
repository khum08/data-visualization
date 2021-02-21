function draw(ctx, ret, isStroke = true, style = randomColor()) {
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    let start = ret[0];
    ctx.moveTo(start.x, start.y);
    for (let i = 1; i < ret.length; i++) {
        let v = ret[i];
        ctx.lineTo(v.x, v.y);
        start = v;
    }
    // ctx.closePath();
    if (isStroke) {
        ctx.strokeStyle = style;
        ctx.stroke();
    } else {
        ctx.fillStyle = style;
        ctx.fill();
    }
}

function randomColor() {
    const getRandom = () => {
        return Math.random() * 255;
    }
    return `rgb(${getRandom()}, ${getRandom()}, ${getRandom()})`;
}

function drawAxis(isX = true) {
    const max = 2 ** 10;
    const points = [];
    points.push(new Vector2D(isX ? -max : 0, isX ? 0 : -max));
    points.push(new Vector2D(isX ? max : 0, isX ? 0 : max));
    return points;
}