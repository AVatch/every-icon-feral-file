import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';

@Component({
  selector: 'app-icon-grid',
  templateUrl: './icon-grid.component.html',
  styleUrls: ['./icon-grid.component.scss'],
})
export class IconGridComponent implements OnInit, OnDestroy {
  _didInitSimulated: boolean = false;
  _simulated: number[] = Array(24)
    .fill(0)
    .map((_) => (Math.random() > 0.5 ? 1 : 0));

  @Input() state: number[] | null = null;
  @Input() restrictTo: number[] | null = null;

  @Output() appSelect: EventEmitter<number> = new EventEmitter();

  get ready(): boolean {
    return this.state !== null;
  }

  get grid(): number[][] {
    let _grid: number[][] = [];

    const chunkSize = 32;
    for (let i = 0; i < (this.state ?? []).length; i += chunkSize) {
      _grid = [..._grid, (this.state ?? []).slice(i, i + chunkSize)];
    }

    return _grid;
  }

  constructor() {}

  ngOnInit(): void {
    this.run();
  }

  ngOnDestroy(): void {
    window.clearInterval();
  }

  run() {
    this.frame();
    setInterval(() => {
      this.frame();
    }, 50);
    // }, 1000);
  }

  frame() {
    if (this.state === null || (this.state || []).length === 0) {
      return;
    }

    // init simulated
    if (!this._didInitSimulated) {
      this._simulated = [...this.state.slice(0, 24)];
      this._didInitSimulated = true;
    }

    // setup buffer
    let buffer = [...this._simulated];

    if (buffer.length < 1) {
      return;
    }

    if (buffer[0] === 0) {
      buffer[0] = 1;
    } else {
      buffer[0] = 0;

      let shouldCarry = true;
      let pointer = 1;

      while (shouldCarry) {
        if (buffer.length < pointer) {
          pointer = 1;
          shouldCarry = false;
        } else if (buffer[pointer] === 1) {
          buffer[pointer] = 0;
          pointer += 1;
        } else {
          buffer[pointer] = 1;
          shouldCarry = false;
        }
      }
    }

    this._simulated = buffer;
  }

  onSelect(i: number) {
    console.log('onSelect', i);
    this.appSelect.emit(i);
  }

  canSelect(i: number): boolean {
    return (this.restrictTo || []).includes(i);
  }

  tileTrackByFn(index: number, item: number): any {
    return item;
  }

  rowTrackByFn(index: number, item: number[]): any {
    return index;
  }
}
