import { TestBed } from "@angular/core/testing";

import { AnswerBank, AnswerDoc, AnswerService } from "./answer.service";
import { FirebaseService } from "./firebase.service";
import { of, throwError } from "rxjs";
import { map, switchMap } from "rxjs/operators";

describe("AnswerService", () => {
  let service: AnswerService;

  const firebaseServiceSpy = jasmine.createSpyObj("FirebaseService", ["setDoc", "getDoc"]);

  const testId = "testId";

  const testAnswerDoc: AnswerDoc = {
    id: testId,
    answers: ["HELLO", "GOODBYE", "TEST"],
    themeAnswers: { THEME: [0, 2], ANSWER: [] },
  };

  const testAnswerBank: AnswerBank = {
    id: testId,
    answers: ["HELLO", "GOODBYE", "TEST"],
    themeAnswers: new Map<string, Array<number>>(Object.entries({ THEME: [0, 2], ANSWER: [] })),
  };

  beforeEach(() => {
    firebaseServiceSpy.getDoc.and.returnValue(of(testAnswerDoc));
    firebaseServiceSpy.setDoc.and.returnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [{ provide: FirebaseService, useValue: firebaseServiceSpy }],
      teardown: { destroyAfterEach: false },
    });
    service = TestBed.inject(AnswerService);

    service.answerBank.id = "someId";
    service.answerBank.answers = ["ANSWER1", "ANSWER2"];
    service.answerBank.themeAnswers = new Map<string, Array<number>>(Object.entries({ "THEMEANSWER": [1, 4] }));
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("loadAnswers", () => {
    it("should load answer bank with docData when successful", () => {
      service.loadAnswers(testId).subscribe((result: boolean) => {
        expect(result).toEqual(true);
        expect(service.answerBank.id).toEqual(testId);
        expect(service.answerBank.themeAnswers).toEqual(testAnswerBank.themeAnswers);
        expect(service.answerBank.answers).toEqual(testAnswerBank.answers);
      });
    });

    it("should return false when id equals current puzzle id", () => {
      service
        .loadAnswers(testId)
        .pipe(switchMap(() => service.loadAnswers(testId)))
        .subscribe((result) => {
          expect(result).toEqual(false);
        });
    });

    it("should return throw error when unsuccessful", () => {
      const errorMsg = "Failed to get doc";
      firebaseServiceSpy.getDoc.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.loadAnswers(testId).subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        }
      );
    });
  });

  describe("addAnswer", () => {
    it("add answer to themeAnswers when true", () => {
      service.addAnswer("some theme answer", true);

      expect(service.answerBank.themeAnswers.size).toEqual(2);
      expect(service.answerBank.themeAnswers.has("SOMETHEMEANSWER")).toEqual(true);
    });

    it("add answer to answers when false", () => {
      service.addAnswer("some answer", false);

      expect(service.answerBank.answers.length).toEqual(3);
      expect(service.answerBank.answers.includes("SOMEANSWER")).toEqual(true);
    });
  });

  describe("removeAnswer", () => {
    it("should remove answer from themeAnswers when true", () => {
      service.removeAnswer("themeanswer", true);

      expect(service.answerBank.themeAnswers.size).toEqual(0);
      expect(service.answerBank.themeAnswers.has("THEMEANSWER")).toEqual(false);
    });

    it("should remove answer from themeAnswers when false", () => {
      service.removeAnswer("answer", false);

      expect(service.answerBank.answers.length).toEqual(1);
      expect(service.answerBank.answers.includes("ANSWER")).toEqual(false);
    });
  });

  describe("toggleCircle", () => {
    it("should remove circle if exists", () => {
      service.toggleCircle("themeanswer", 1);

      expect(service.answerBank.themeAnswers.get("THEMEANSWER")).toEqual([4]);
    });

    it("should add circle if doesn't exist", () => {
      service.toggleCircle("themeanswer", 2);

      expect(service.answerBank.themeAnswers.get("THEMEANSWER")).toEqual([1, 4, 2]);
    });
  });

  describe("clearAnswers", () => {
    it("should clear answer bank", () => {
      service.clearAnswers();

      expect(service.answerBank.id).toEqual("someId");
      expect(service.answerBank.themeAnswers.size).toEqual(0);
      expect(service.answerBank.answers.length).toEqual(0);
    });
  });

  describe("saveAnswers", () => {
    it("should save answers successful", () => {
      service
        .loadAnswers(testId)
        .pipe(map(() => service.saveAnswers()))
        .subscribe(() => {
          expect(firebaseServiceSpy.setDoc).toHaveBeenCalledWith("answers", testId, testAnswerDoc);
        });
    });

    it("should throw error when setDoc unsuccessful", () => {
      const errorMsg = "Failed to set doc";
      firebaseServiceSpy.setDoc.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.saveAnswers().subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        }
      );
    });
  });
});
