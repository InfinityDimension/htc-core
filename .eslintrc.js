// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  // https://github.com/standard/standard/blob/master/docs/RULES-en.md
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    "semi": 0,//语句强制分号结尾
    //空行最多不能超过100行
    "no-multiple-empty-lines": [0, {"max": 100}],
    //关闭禁止混用tab和空格
    "no-mixed-spaces-and-tabs": [0],
    "no-inline-comments": 0,//禁止行内备注
    "no-new-func": 1,//禁止使用new Function
    "no-new-object": 2,//禁止使用new Object()
    "no-new-require": 2,//禁止使用new require
    "no-undef":0,
    "camelcase": 2,//强制驼峰法命名
    "eqeqeq": 2,//必须使用全等
    "strict": 2,//使用严格模式
    "indent": 0,//缩进风格
    "space-after-keywords": 0,//关键字后面是否要空一格
    "space-before-blocks": 0,//不以新行开始的块{前面要不要有空格
    "space-before-function-paren": 0,//函数定义时括号前面要不要有空格
    "space-in-parens": 0,//小括号里面要不要有空格
    "space-infix-ops": 0,//中缀操作符周围要不要有空格
    "space-unary-ops": 0,//一元运算符的前/后要不要加空格
    "spaced-comment": 0,//注释风格要不要有空格什么的
    "no-array-constructor": 0,
    "keyword-spacing": 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
