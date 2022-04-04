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
  _simulated: number[] = Array(32)
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
      this._simulated = [...this.state.slice(0, 32)];
      this._didInitSimulated = true;
    }

    // let next = [...this.state.slice(this._pointer, 32 + 1)];
    let next = [...this._simulated];

    if (next[0] === 1) {
      next[0] = 0;
    } else {
      next[0] = 1;

      let shouldCarry = true;
      let pointer = 1;
      while (shouldCarry) {
        if (next[pointer] === 0) {
          next[pointer] = 1;
          pointer += 1;
        } else {
          next[pointer] = 0;
          shouldCarry = false;
        }
      }
    }

    this._simulated = next;
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

  tileTrackByFn(index: number, item: number): any {
    return item;
  }

  rowTrackByFn(index: number, item: number[]): any {
    return index;
  }
}
