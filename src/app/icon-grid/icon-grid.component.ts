// import * as p5 from 'p5';

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-icon-grid',
  templateUrl: './icon-grid.component.html',
  styleUrls: ['./icon-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconGridComponent implements OnInit {
  @Input() state: number[] | null = null;
  @Input() restrictTo: number[] | null = null;

  @Output() appSelect: EventEmitter<number> = new EventEmitter();

  get ready(): boolean {
    return this.state !== null;
  }

  get grid(): number[][] {
    let _grid: number[][] = [];

    const chunkSize = 32;
    for (let i = 0; i < (this.state || []).length; i += chunkSize) {
      _grid = [..._grid, (this.state || []).slice(i, i + chunkSize)];
    }

    return _grid;
  }

  constructor() {}

  ngOnInit(): void {
    console.log(this.state);
  }

  onSelect(i: number) {
    // check if allowed
    if (!this.canSelect(i)) {
      return;
    }

    this.appSelect.emit(i);
  }

  canSelect(i: number): boolean {
    return (this.restrictTo || []).includes(i);
  }
}

// TODO: Enable sketch

// ngAfterViewInit(): void {
//   // this.configure();
// }

// private configure() {
//   const sketch = (s: any) => {
//     s.preload = () => {};

//     s.setup = () => {
//       let c = s.createCanvas(512, 512);
//       c.parent('sketch-holder');
//       c.background(200);

//       // displayIcon = new Icon(0, 2, 0);
//     };

//     s.draw = () => {};

//     s.mouseReleased = () => {};

//     s.keyPressed = () => {};
//   };

//   this.canvas = new p5(sketch);
// }

// class Icon {
//   id: number;

//   size: number;
//   w: number;
//   h: number;

//   x: number;
//   y: number;

//   state: number[] = [];

//   canvas?: p5;

//   constructor(options: {
//     id: number;
//     size: number;
//     x: number;
//     y: number;
//     canvas: p5;
//   }) {
//     this.id = options.id;

//     this.size = options.size;
//     this.w = options.size / 2;
//     this.h = options.size / 2;

//     this.x = options.x;
//     this.y = options.y;

//     this.canvas = options.canvas;

//     for (let m = 0; m < 1024; m++) {
//       this.state[m] = 1;
//     }
//   }

//   fillIcon(iconArray: number[]) {
//     for (let i = 0; i < 1024; i++) {
//       this.state[i] = iconArray[i];
//     }
//   }

//   set_pixel(xpix: number, ypix: number) {
//     if (this.state[ypix * this.size + xpix] == 1) {
//       this.state[ypix * this.size + xpix] = 0;
//     } else {
//       this.state[ypix * this.size + xpix] = 1;
//     }
//   }

//   Increment_Icon() {
//     let carry_bit = 0;

//     this.id = 1;

//     if (this.state[0] == 1) {
//       this.state[0] = 0;
//     } else {
//       this.state[0] = 1;

//       carry_bit = 1;

//       //Propogate numbers
//       while (carry_bit == 1) {
//         if (this.state[this.id] == 0) {
//           //if the pixel i
//           this.state[this.id] = 1;
//           this.id++;
//         } else {
//           this.state[this.id] = 0;
//           carry_bit = 0;
//         }
//       }
//     }
//   }

//   paintIcon(x: number, y: number) {
//     if (this.canvas === undefined) {
//       return;
//     }

//     let temp_counter = 0;
//     let m = 0;
//     let n = 0;

//     this.canvas.stroke(196);

//     for (let i = 0; i < this.state.length; i++) {
//       x = i % this.size;
//       y = Math.floor(i / this.size);

//       this.canvas
//         .fill(this.state[i] == 0 ? 0 : 255)
//         .rect(x * this.size, y * this.size, this.size, this.size);
//     }
//   }
// }
