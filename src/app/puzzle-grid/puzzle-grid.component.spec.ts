import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleGridComponent } from './puzzle-grid.component';

describe('PuzzleGridComponent', () => {
  let component: PuzzleGridComponent;
  let fixture: ComponentFixture<PuzzleGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PuzzleGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PuzzleGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
