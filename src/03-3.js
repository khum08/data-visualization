function loadImage(url) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    return new Promise(function(resolve, reject) {
        img.onload = () => {
            resolve(img);
        }
        img.src = url;
    });
}


function getImageData(img, rect = {
    x: 0,
    y: 0,
    width: img.width,
    height: img.height
}) {
    const {width, height} = img;

    const offscreenCanvas = new OffscreenCanvas(width, height);
    let ctx = offscreenCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height, rect.x, rect.y, rect.width, rect.height);
    let imageData = ctx.getImageData(0, 0, rect.width, rect.height);
    return imageData;
}


function transform(imageData, pass) {
    const {width, height, data} = imageData;
    let length = data.length;
    console.log('length:', length);
    for(let i = 0; i < length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        let a = data[i + 3];
        const re = pass({
            r, g, b, a,
            index: i,
            width: width,
            height: height,
            x: ((i / 4) % width) / width,
            y: Math.floor(i / 4 / width) / height
        });
        data.set(re, i);
    }
}


async function start() {
    const canvas2d = document.getElementById('canvas');
    const ctx = canvas2d.getContext('2d');

    // let url = '../assets/pz.png';
    let url = '../assets/splash.jpg';
    const img = await loadImage(url);

    const imageData = getImageData(img, {
        x: 0,
        y: 0,
        width: canvas2d.width,
        height: canvas2d.height
    });
    transform(imageData, d => {
        let {r, g, b, a, x, y} = d;
        // 变亮
        // return [r * 1.5, g, b, a];

        // 圆角模糊
        // let dis = Math.hypot(x - 0.5, y - 0.5);
        // let na = a * (1.0 - 2 * dis);
        // return [r, g, b, na];

        // 正方形模糊
        const contain = (x, y, min) => {
            let max = 1 - min;
            return (x < min || x > max || y < min || y > max) ? false : true;
        }
        let isCenter = contain(x, y, 0.1);
        if (!isCenter) {
            a *= (x + 1) % 1;
        }
        // return [r, g, b, a];

        // 灰度
        let v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return [v, v, v, a];
    });
    console.log('result');
    ctx.putImageData(imageData, 0, 0, 0, 0, canvas2d.width, canvas2d.height);
}

start();