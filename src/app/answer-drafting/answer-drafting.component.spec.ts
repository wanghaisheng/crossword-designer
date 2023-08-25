import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerDraftingComponent } from './answer-drafting.component';

describe('AnswerDraftingComponent', () => {
  let component: AnswerDraftingComponent;
  let fixture: ComponentFixture<AnswerDraftingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnswerDraftingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerDraftingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
