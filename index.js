#!/usr/bin/env node

const { createCanvas, loadImage } = require('canvas');
const program = require('commander');
const fs = require('fs');

async function run(program) {
  const input_image = await loadImage(program.input);
  const IMAGE_WIDTH = input_image.width;
  const IMAGE_HEIGHT = input_image.height;
  const OUTPUT_WIDTH = program.width || IMAGE_WIDTH;
  const OUTPUT_HEIGHT = program.height || IMAGE_HEIGHT;
  const PADDING = OUTPUT_WIDTH > OUTPUT_HEIGHT ?
    OUTPUT_HEIGHT * (parseFloat(program.padding || 10) / 100) :
    OUTPUT_WIDTH * (parseFloat(program.padding || 10) / 100);


  const canvas = createCanvas(OUTPUT_WIDTH, OUTPUT_HEIGHT);
  const ctx = canvas.getContext('2d');

  const words = program.text.split("\\n");
  ctx.fillStyle = program.color || '#ffffff';

  for (let size = (OUTPUT_HEIGHT - PADDING); size > 0; size--) {
    ctx.font = `${size}px '${program.font || 'Arial'}'`;

    textSizes = [];
    for (let word_index = 0; word_index < words.length; word_index++) {
      let textSize = ctx.measureText(words[word_index]);
      if (textSize.width >= (OUTPUT_WIDTH - PADDING)) {
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
    if (totalHeight > OUTPUT_HEIGHT - PADDING) {
      continue;
    }

    ctx.drawImage(input_image, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

    let yStart = OUTPUT_HEIGHT / 2 - totalHeight / 2;
    for (let word_index = 0; word_index < words.length; word_index++) {
      yStart += textSizes[word_index].emHeightAscent + textSizes[word_index].emHeightDescent;
      ctx.fillText(words[word_index], OUTPUT_WIDTH / 2 - textSizes[word_index].width / 2, yStart - textSizes[word_index].emHeightDescent);
    }
    fs.writeFileSync(program.output, canvas.toBuffer());

    break;
  }
}

program
  .version('1.0.0', '-v, --version')
  .option('-i, --input [path]', 'Input image path')
  .option('-o, --output [path]', 'Output image path')
  .option('-t, --text [string]', 'Text to print, you can add \\n for line breaks')
  .option('-w, --width [integer]', 'Width of the output image (default: same as input)')
  .option('-h, --height [integer]', 'Height of the output image (default: same as input)')
  .option('-p, --padding [integer]', 'Padding in percentage of the output size (default: 10)')
  .option('-c, --color [string]', 'Text color (default: #ffffff)')
  .option('-f, --font [string]', 'Font to use (default: Arial)')
  .parse(process.argv)

if (!program.input || !program.output || !program.text) {
  program.outputHelp();
} else {
  run (program);
}
