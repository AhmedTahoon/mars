import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarsCommandsComponent } from './mars-commands.component';

describe('MarsCommandsComponent', () => {
  let component: MarsCommandsComponent;
  let fixture: ComponentFixture<MarsCommandsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarsCommandsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarsCommandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
