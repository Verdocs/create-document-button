import { Component, OnInit, Input, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { VerdocsHeaderService } from '@verdocs/header';
import { VerdocsTokenObjectService } from '@verdocs/tokens';
import { TemplatesService, ITemplate } from '@verdocs/sdk';
import { Subscription } from 'rxjs';

import { CreateEnvelopeService, FixedDialogRef } from './create-dialog/create-envelope';

@Component({
  selector: 'lib-create-button',
  templateUrl: './create-button.components.html',
  styles: []
})
export class CreateButtonComponent implements OnInit, OnDestroy {
  @Input()
  public template: ITemplate;
  @Input()
  public mode: 'dashboard' | 'embed' | 'liveview' | 'signerview' | 'builder' | 'preview' = 'embed';
  @Input()
  public templateOwnerInfo: any = null;
  @Input()
  public totalPages: any[];
  @Input()
  public pageRendered: number[] = [];
  public hasCreateDialog = false;
  public currentProfile: any = null;
  public isTemplateOwner = false;
  public isInProgress = (this.totalPages && (this.pageRendered.length < this.totalPages.length)) || !!this.totalPages && !!this.pageRendered ? !this.totalPages : false;
  
  private _canSend: boolean = null;
  private _createEnvelopeDialog: FixedDialogRef
  private _createButtonToggleSubscription = new Subscription();
  private _canClickCreate: boolean = null;

  constructor(
    private templatesService: TemplatesService,
    private verdocsHeaderService: VerdocsHeaderService,
    private vTokenObjectService: VerdocsTokenObjectService,
    private createEnvelope: CreateEnvelopeService,
    @Inject(PLATFORM_ID) private platform
  ) { }

  ngOnInit() {
    this.currentProfile = this.vTokenObjectService.getProfile();
    this._createButtonToggleSubscription = this.verdocsHeaderService.createToggleSubscription.subscribe(status => {
      if (status) {
        if (!this.hasCreateDialog) {
          this.openCreateEnvelopeDialog(true);
        } else {
          if (!this.currentProfile) {
            this._createEnvelopeDialog.close();
          }
          this.openCreateEnvelopeDialog(true);
        }
      }
    });
  }

  ngOnDestroy() {
    this._createButtonToggleSubscription.unsubscribe();
  }

  canClickCreate() {
    if (typeof (this._canClickCreate) !== 'boolean') {
      if (!this.currentProfile) {
        this._canClickCreate = this.template ? this.template.is_public : false;
      } else {
        this._canClickCreate = this.canSendEnvelope();
      }
    }
    return this._canClickCreate;
  }

  canSendEnvelope() {
    if (typeof (this._canSend) !== 'boolean' && this.templatesService) {
      this._canSend = this.templatesService.canSendEnvelope(this.template);
    }
    return this._canSend;
  }

  openCreateEnvelopeDialog(manual?: boolean) {
    if (this.canClickCreate()) {

      let width = 380;
      let marginRight = 24;
      if ((isPlatformBrowser(this.platform))) {
        if (window.innerWidth && window.innerWidth <= 480) {
          width = window.innerWidth;
          marginRight = 0;
        } else {
          width = 380;
          marginRight = 24;
        }
      }

      this._createEnvelopeDialog = this.createEnvelope.open({
        position: {
          bottom: '0px',
          right: `${marginRight}px`
        },
        width: `${width}px`,
        height: '48px',
        maxHeight: '80vh'
      });
      this.createEnvelope.updateAllPositions(this.createEnvelope.openDialogs);
      this._createEnvelopeDialog._containerInstance.template = this.template;
      this._createEnvelopeDialog._containerInstance._templateSource = this.mode;
      this._createEnvelopeDialog._containerInstance.mode = this.mode;
      this._createEnvelopeDialog._containerInstance.templateOwnerInfo = this.templateOwnerInfo;
      this._createEnvelopeDialog._containerInstance.isTemplateOwner = this.isTemplateOwner;
      this._createEnvelopeDialog._containerInstance.templateId = this.template.id;
      this._createEnvelopeDialog._containerInstance.currentProfile = this.currentProfile;
      this._createEnvelopeDialog._containerInstance.initializeData();
      if (manual) {
        const timer = setTimeout(() => {
          this._createEnvelopeDialog.expand();
          clearTimeout(timer);
        }, 250);
      }
      this._createEnvelopeDialog.afterClosed().subscribe(() => {
        this.updateHasCreateDialog();
        this.createEnvelope.updateAllPositions(this.createEnvelope.openDialogs);
      })
      this.updateHasCreateDialog();
    }
  }

  updateHasCreateDialog(): void {
    if (this.createEnvelope.openDialogs.length > 0) {
      this.hasCreateDialog = true;
    } else {
      this.hasCreateDialog = false;
    }
  }

  checkInProgress() {
    this.isInProgress = (this.totalPages && (this.pageRendered.length < this.totalPages.length)) || !this.totalPages
  }

}
