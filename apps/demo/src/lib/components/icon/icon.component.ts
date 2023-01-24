import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-icon',
    '[class.app-icon-inverted]': 'invert',
    '[class.app-icon-round]': 'round',
    '[style.background-image]': 'iconUrl',
  },
})
export class IconComponent {
  @Input()
  get iconUrl() {
    return this._iconUrl;
  }
  set iconUrl(value: string | undefined) {
    this._iconUrl = typeof value === 'string' ? `url(${value})` : value;
  }
  private _iconUrl?: string;

  @Input() invert?: boolean | null;
  @Input() round?: boolean | null;
}
