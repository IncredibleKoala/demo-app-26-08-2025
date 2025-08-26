import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

/**
 * Component for displaying a two-slot pane (that looks like page heading)
 */
@Component({
  selector: 'shared-ui-page-header',
  standalone: true,
  templateUrl: './shared-ui-page-header.component.html',
  styleUrls: ['./shared-ui-page-header.component.scss'],
  imports: [NgTemplateOutlet],
})
export class SharedUiPageHeaderComponent {
  @Input()
  public title?: string;

  @ContentChild('titleTemplate')
  public titleTemplate?: TemplateRef<any>;

  @ContentChild('rightPanelTemplate')
  public rightPanelTemplate?: TemplateRef<any>;
}
