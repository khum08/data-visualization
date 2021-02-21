class Vector2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    rotate(rad) {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const x = this.x;
        const y = this.y;
        this.x = x * c + y * -s;
        this.y = x * s + y * c;
        return this;
    }
    copy() {
        return new Vector2D(this.x, this.y);
    }

    add(v) {
        this.x = this.x + v.x;
        this.y = this.y + v.y;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    scale(length) {
        this.x *= length;
        this.y *= length;
        return this;
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    cross(v) {
        return this.x * v.y - this.y * v.x;
    }

    length() {
        return Math.hypot(this.x, this.y);
    }
}

function inTriangle(p1, p2, p3, point) {
    const a = p2.copy().sub(p1);
    const b = p3.copy().sub(p2);
    const c = p1.copy().sub(p3);

    const u1 = point.copy().sub(p1);
    const u2 = point.copy().sub(p2);
    const u3 = point.copy().sub(p3);

    const s1 = Math.sign(a.cross(u1));
    const s2 = Math.sign(b.cross(u2));
    const s3 = Math.sign(c.cross(u3));

    let p = a.dot(u1) / a.length() ** 2;
    if (s1 === 0 && p >= 0 && p <= 1) {
        return true;
    }

    p = b.dot(u2) / b.length() ** 2;
    if (s2 === 0 && p >= 0 && p <= 1) {
        return true;
    }

    p = c.dot(u3) / c.length() ** 2;
    if (s3 === 0 && p >= 0 && p <= 1) {
        return true;
    }

    return s1 === s2 && s2 === s3;
}