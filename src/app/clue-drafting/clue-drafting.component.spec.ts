import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClueDraftingComponent } from './clue-drafting.component';

describe('ClueDraftingComponent', () => {
  let component: ClueDraftingComponent;
  let fixture: ComponentFixture<ClueDraftingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClueDraftingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClueDraftingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
