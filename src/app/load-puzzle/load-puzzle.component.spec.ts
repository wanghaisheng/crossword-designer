import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LoadPuzzleComponent } from "./load-puzzle.component";
import { of, throwError } from "rxjs";
import { TestPuzzle } from "src/environments/environment";
import { LoadService } from "../services/load.service";
import { ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AnswerService } from "../services/answer.service";
import { PuzzleService } from "../services/puzzle.service";

describe("LoadPuzzleComponent", () => {
  let component: LoadPuzzleComponent;
  let fixture: ComponentFixture<LoadPuzzleComponent>;

  const loadServiceSpy = jasmine.createSpyObj("LoadService", ["setActiveId", "createPuzzle", "getPuzzleList"]);
  const answerServiceSpy = jasmine.createSpyObj("AnswerService", ["loadAnswers"]);
  const puzzleServiceSpy = jasmine.createSpyObj("PuzzleService", ["loadPuzzle"]);
  const routerSpy = jasmine.createSpyObj("RouterService", ["navigateByUrl"]);

  beforeEach(async () => {
    answerServiceSpy.loadAnswers.and.returnValue(of(true));
    puzzleServiceSpy.loadPuzzle.and.returnValue(of(true));
    loadServiceSpy.getPuzzleList.and.returnValue(of([TestPuzzle]));
    loadServiceSpy.createPuzzle.and.returnValue(of(true));
    loadServiceSpy.setActiveId.calls.reset();
    spyOn(window, "alert");
    spyOn(console, "error");

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [LoadPuzzleComponent],
      providers: [
        { provide: LoadService, useValue: loadServiceSpy },
        { provide: AnswerService, useValue: answerServiceSpy },
        { provide: PuzzleService, useValue: puzzleServiceSpy },
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
    it("should call loadPuzzle, loadAnswers and setActiveId with id", () => {
      component.loadPuzzle("test-id");

      expect(answerServiceSpy.loadAnswers).toHaveBeenCalledWith("test-id");
      expect(puzzleServiceSpy.loadPuzzle).toHaveBeenCalledWith("test-id");
      expect(loadServiceSpy.setActiveId).toHaveBeenCalledWith("test-id");
    });

    it("should not call loadPuzzle if id empty", () => {
      component.loadPuzzle("");

      expect(loadServiceSpy.setActiveId).not.toHaveBeenCalled();
    });

    it("should alert failure when puzzle load fails", () => {
      const errorMsg = "Failed to get doc";
      puzzleServiceSpy.loadPuzzle.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      fixture.detectChanges();
      component.loadPuzzle("testId");

      expect(puzzleServiceSpy.loadPuzzle).toHaveBeenCalledWith("testId");
      expect(window.alert).toHaveBeenCalledWith("Failed to load puzzle: Failed to get doc");
    });
  });

  describe("createPuzzle", () => {
    it("should do nothing when puzzle successfully created and activated", () => {
      component.newPuzzleForm.setValue({ title: "New Puzzle", width: 10, height: 12 });

      fixture.detectChanges();
      component.createPuzzle();

      expect(loadServiceSpy.createPuzzle).toHaveBeenCalledWith("New Puzzle", 10, 12);
      expect(window.alert).not.toHaveBeenCalled();
    });

    it("should log error when puzzle not successfully created and activated", () => {
      loadServiceSpy.createPuzzle.and.returnValue(of(false));
      component.newPuzzleForm.setValue({ title: "New Puzzle", width: 10, height: 12 });

      fixture.detectChanges();
      component.createPuzzle();

      expect(loadServiceSpy.createPuzzle).toHaveBeenCalledWith("New Puzzle", 10, 12);
      expect(console.error).toHaveBeenCalledWith("Something went wrong during puzzle creation...");
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
});
