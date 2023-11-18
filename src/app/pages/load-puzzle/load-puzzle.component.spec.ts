import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";

import { of, throwError } from "rxjs";

import { TestPuzzle } from "src/environments/environment";
import { LoadPuzzleComponent } from "./load-puzzle.component";
import { LoadService } from "src/app/services/load.service";

describe("LoadPuzzleComponent", () => {
  let component: LoadPuzzleComponent;
  let fixture: ComponentFixture<LoadPuzzleComponent>;

  const loadServiceSpy = jasmine.createSpyObj("LoadService", [
    "setActiveId",
    "createPuzzle",
    "loadPuzzle",
    "deletePuzzle",
    "getPuzzleList",
    "updatePuzzle",
  ]);
  const routerSpy = jasmine.createSpyObj("Router", ["navigateByUrl"]);

  const testId = "test-id";

  beforeEach(async () => {
    loadServiceSpy.getPuzzleList.and.returnValue(of([{ id: testId, ...TestPuzzle }]));
    loadServiceSpy.createPuzzle.and.returnValue(of(undefined));
    loadServiceSpy.deletePuzzle.and.returnValue(of(undefined));
    loadServiceSpy.updatePuzzle.and.returnValue(of(undefined));

    spyOn(window, "alert");
    spyOn(console, "error");

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [LoadPuzzleComponent],
      providers: [
        { provide: LoadService, useValue: loadServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadPuzzleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("onPuzzleSelect", () => {
    it("should set active id and re-route", () => {
      component.onPuzzleSelect(testId);

      expect(loadServiceSpy.setActiveId).toHaveBeenCalledWith(testId);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith("/answers");
    });
  });

  describe("createPuzzle", () => {
    it("should re-route when puzzle successfully created", () => {
      component.newPuzzleForm.setValue({ title: "New Puzzle", width: 10, height: 12 });

      fixture.detectChanges();
      component.createPuzzle();

      expect(loadServiceSpy.createPuzzle).toHaveBeenCalledWith("New Puzzle", 10, 12);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith("/answers");
    });

    it("should alert failure when puzzle creation fails", () => {
      const errorMsg = "Failed to add doc";
      loadServiceSpy.createPuzzle.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });
      component.newPuzzleForm.setValue({ title: "New Puzzle", width: 10, height: 12 });

      fixture.detectChanges();
      component.createPuzzle();

      expect(loadServiceSpy.createPuzzle).toHaveBeenCalledWith("New Puzzle", 10, 12);
      expect(window.alert).toHaveBeenCalledWith("Failed to create puzzle: Failed to add doc");
    });
  });

  describe("deletePuzzle", () => {
    it("should remote puzzle from list when puzzle successfully deleted", () => {
      component.deletePuzzle(testId);

      expect(loadServiceSpy.deletePuzzle).toHaveBeenCalledWith(testId);
      expect(component.puzzleList.findIndex((p) => p.id == testId)).toEqual(-1);
    });

    it("should alert failure when puzzle deletion fails", () => {
      const errorMsg = "Failed to delete doc";
      loadServiceSpy.deletePuzzle.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      component.deletePuzzle(testId);

      expect(loadServiceSpy.deletePuzzle).toHaveBeenCalledWith(testId);
      expect(window.alert).toHaveBeenCalledWith("Failed to delete puzzle: Failed to delete doc");
    });
  });

  describe("setPuzzleLock", () => {
    it("should set puzzle lock when update successful", () => {
      component.setPuzzleLock(testId, true);
      const puzzle = component.puzzleList.find((p) => p.id == testId);

      expect(loadServiceSpy.updatePuzzle).toHaveBeenCalledWith(testId, { locked: true });
      expect(puzzle?.locked).toEqual(true);
    });

    it("should alert failure when update fails", () => {
      const errorMsg = "Failed to update doc";
      loadServiceSpy.updatePuzzle.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      component.setPuzzleLock(testId, false);

      expect(loadServiceSpy.updatePuzzle).toHaveBeenCalledWith(testId, { locked: false });
      expect(window.alert).toHaveBeenCalledWith("Failed to update puzzle: Failed to update doc");
    });
  });
});
