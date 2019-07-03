# badge-generator
Image badge generator

```
Usage: index [options]

Options:
  -v, --version                                            output the version number
  -i, --input <path>                                       Input image path
  -o, --output <path>,[width],[height]                     Output image path with optional [width] and [height]
  -t, --text <string>                                      Text to print, you can add \n for line breaks
  -a, --alignment <string>                                 How to align the text relative to the box edges: can be left, center, right (default: center)
  -p, --position <x>,<y>                                   Position of the text center, <x>,<y> (default: center of the input)
  -b, --box <width>,<height>,[padding]                     Width and height of the text box (default: dimensions of the output)
  -s, --shadow <offsetX>,<offsetY>,<blur>,<color>,<alpha>  Shadow parameters (default: no shadow)
  -c, --color <string>                                     Text color (default: #ffffff)
  -f, --font <string>                                      Font to use (default: Arial)
  -h, --help                                               output usage information
```
