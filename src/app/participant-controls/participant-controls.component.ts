import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'app-participant-controls',
  templateUrl: './participant-controls.component.html',
  styleUrls: ['./participant-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipantControlsComponent implements OnInit {
  @Input() interactable: boolean | null = null;

  constructor() {}

  ngOnInit(): void {}
}
