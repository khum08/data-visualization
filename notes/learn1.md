# 图形基础篇
## 01-浏览器中实现可视化的四种方式

## 02-指令式绘图系统:如何用Canvas绘制层次关系图

- canvas 标签上设置的属性宽高决定画布的宽高，css中设置的宽高是页面的样式宽高
- 坐标系和浏览器一样,与笛卡尔坐标系相反
- const context = canvas.getContext('2d');来获取context
- 绘制中心点问题，平移后会改变canvas状态，可以通过save保存当前canvas状态，然后通过restore恢复；
- context的api有两类，一类设置状态,一类是绘制指令
- 优点：简单易用;高效
- 缺点：只是一个个像素点，没有图像对象，无法对其进行操作

https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial

## 03-声明式图形系统:如何利用svg图形元素进行绘制可视化图表呢。

## 04-GPU与渲染管线：如何用WebGL绘制最简单的几何图形