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
    scale(length) {
        this.x *= length;
        this.y *= length;
        return this;
    }
}