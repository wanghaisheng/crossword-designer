import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LoadPuzzleComponent } from "./load-puzzle.component";
import { of, throwError } from "rxjs";
import { TestPuzzle } from "src/environments/environment";
import { LoadService } from "../services/load.service";
import { ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";

describe("LoadPuzzleComponent", () => {
  let component: LoadPuzzleComponent;
  let fixture: ComponentFixture<LoadPuzzleComponent>;

  const loadServiceSpy = jasmine.createSpyObj("LoadService", [
    "createPuzzle",
    "loadPuzzle",
    "deletePuzzle",
    "getPuzzleList",
    "updatePuzzle",
  ]);
  const routerSpy = jasmine.createSpyObj("Router", ["navigateByUrl"]);

  const testId = "testId";

  beforeEach(async () => {
    loadServiceSpy.getPuzzleList.and.returnValue(of([TestPuzzle]));
    loadServiceSpy.createPuzzle.and.returnValue(of(undefined));
    loadServiceSpy.loadPuzzle.and.returnValue(of(undefined));
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

  describe("loadPuzzle", () => {
    it("should re-route when puzzle successfully loaded and activated", () => {
      component.loadPuzzle(testId);

      expect(loadServiceSpy.loadPuzzle).toHaveBeenCalledWith(testId);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith("/answers");
    });

    it("should alert failure when puzzle creation fails", () => {
      const errorMsg = "Failed to get doc";
      loadServiceSpy.loadPuzzle.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      component.loadPuzzle(testId);

      expect(loadServiceSpy.loadPuzzle).toHaveBeenCalledWith(testId);
      expect(window.alert).toHaveBeenCalledWith("Failed to load puzzle: Failed to get doc");
    });
  });

  describe("createPuzzle", () => {
    it("should re-route when puzzle successfully created and activated", () => {
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
