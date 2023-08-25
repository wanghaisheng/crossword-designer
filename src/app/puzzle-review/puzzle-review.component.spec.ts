import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleReviewComponent } from './puzzle-review.component';

describe('PuzzleReviewComponent', () => {
  let component: PuzzleReviewComponent;
  let fixture: ComponentFixture<PuzzleReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PuzzleReviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PuzzleReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
