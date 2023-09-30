import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleStatsComponent } from './puzzle-stats.component';

describe('PuzzleStatsComponent', () => {
  let component: PuzzleStatsComponent;
  let fixture: ComponentFixture<PuzzleStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PuzzleStatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PuzzleStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
