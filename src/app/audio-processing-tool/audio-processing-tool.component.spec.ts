import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioProcessingToolComponent } from './audio-processing-tool.component';

describe('AudioProcessingToolComponent', () => {
  let component: AudioProcessingToolComponent;
  let fixture: ComponentFixture<AudioProcessingToolComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AudioProcessingToolComponent]
    });
    fixture = TestBed.createComponent(AudioProcessingToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
