#!/usr/bin/env node

const { createCanvas, loadImage, registerFont } = require('canvas');
const program = require('commander');
const Color = require('color');
const fs = require('fs');

async function run(program) {
  const input_image = await loadImage(program.input);
  const IMAGE_WIDTH = input_image.width;
  const IMAGE_HEIGHT = input_image.height;
  const OUTPUT_WIDTH = parseInt(program.output && program.output.width) || IMAGE_WIDTH;
  const OUTPUT_HEIGHT = parseInt(program.output && program.output.height) || IMAGE_HEIGHT;
  const BOX_WIDTH = parseInt(program.box && program.box.width) || OUTPUT_WIDTH;
  const BOX_HEIGHT = parseInt(program.box && program.box.height) || OUTPUT_HEIGHT;
  const PADDING = BOX_WIDTH > BOX_HEIGHT ?
    BOX_HEIGHT * (parseFloat(program.box && program.box.padding || 0)) :
    BOX_WIDTH * (parseFloat(program.box && program.box.padding || 0));
  const CENTER_X = parseInt(program.position && program.position.x) || OUTPUT_WIDTH / 2;
  const CENTER_Y = parseInt(program.position && program.position.y) || OUTPUT_HEIGHT / 2;
  const ALIGN = program.alignment || 'center';

  if (program.font) {
    registerFont(program.font, { family: 'CustomFont' });
  }

  const canvas = createCanvas(OUTPUT_WIDTH, OUTPUT_HEIGHT);
  const ctx = canvas.getContext('2d');

  if (program.shadow) {
    ctx.shadowColor = Color(program.shadow.color).alpha(parseFloat(program.shadow.alpha))
    ctx.shadowOffsetX = parseInt(program.shadow.offsetX);
    ctx.shadowOffsetY = parseInt(program.shadow.offsetX);
    ctx.shadowBlur = parseInt(program.shadow.blur);
  }

  const words = program.text.split("\\n");
  ctx.fillStyle = program.color || '#ffffff';

  for (let size = (BOX_HEIGHT - PADDING); size > 0; size--) {
    ctx.font = `${size}px '${program.font ? 'CustomFont' : 'Arial'}'`;

    textSizes = [];
    for (let word_index = 0; word_index < words.length; word_index++) {
      let textSize = ctx.measureText(words[word_index]);
      if (textSize.width >= (BOX_WIDTH - PADDING)) {
        continue ;
      }
      textSizes.push(textSize);
    }
    if (textSizes.length !== words.length) {
      continue;
    }
    const totalHeight = textSizes.reduce((totalHeight, textSize) => (
      totalHeight + textSize.emHeightAscent + textSize.emHeightDescent
    ), 0);
    if (totalHeight > BOX_HEIGHT - PADDING) {
      continue;
    }

    ctx.drawImage(input_image, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

    let yStart = CENTER_Y - totalHeight / 2;
    for (let word_index = 0; word_index < words.length; word_index++) {
      yStart += textSizes[word_index].emHeightAscent + textSizes[word_index].emHeightDescent;
      let textX;
      if (ALIGN === 'center') {
        textX = CENTER_X - textSizes[word_index].width / 2;
      } else if (ALIGN === 'left') {
        textX = CENTER_X - (BOX_WIDTH / 2) + PADDING;
      } else if (ALIGN === 'right') {
        textX = CENTER_X + (BOX_WIDTH / 2) - PADDING - textSizes[word_index].width;
      }
      ctx.fillText(words[word_index], parseInt(textX), parseInt(yStart - textSizes[word_index].emHeightDescent));
    }
    fs.writeFileSync(program.output.path, canvas.toBuffer());

    break;
  }
}

program
  .version('1.0.0', '-v, --version')
  .option('-i, --input <path>', 'Input image path')
  .option('-o, --output <path>,[width],[height]', 'Output image path with optional [width] and [height]', (output) => {
    const [path, width, height] = output.split(',');

    return ({ path, width, height });
  })
  .option('-t, --text <string>', 'Text to print, you can add \\n for line breaks')
  .option('-a, --alignment <string>', 'How to align the text relative to the box edges: can be left, center, right (default: center)')
  .option('-p, --position <x>,<y>', 'Position of the text center, <x>,<y> (default: center of the input)', (position) => {
    const [x, y] = position.split(',');

    return ({ x, y });
  })
  .option('-b, --box <width>,<height>,[padding]', 'Width and height of the text box (default: dimensions of the output)', (box) => {
    const [width, height, padding] = box.split(',');

    return ({ width, height });
  })
  .option('-s, --shadow <offsetX>,<offsetY>,<blur>,<color>,<alpha>', 'Shadow parameters (default: no shadow)', (shadow) => {
    const [offsetX, offsetY, blur, color, alpha] = shadow.split(',');

    if ([offsetX, offsetY, blur, color, alpha].some((parameter) => !parameter)) {
      program.outputHelp();
      process.exit(1);
    }

    return ({ offsetX, offsetY, blur, color, alpha });
  })

  .option('-c, --color <string>', 'Text color (default: #ffffff)')
  .option('-f, --font <string>', 'Font to use (default: Arial)')
  .parse(process.argv)

if (!program.input || !program.output || !program.text) {
  program.outputHelp();
} else {
  run (program);
}
