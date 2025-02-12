import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VidsrcMoviesShowsComponent } from './vidsrc-movies-shows.component';

describe('VidsrcMoviesShowsComponent', () => {
  let component: VidsrcMoviesShowsComponent;
  let fixture: ComponentFixture<VidsrcMoviesShowsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VidsrcMoviesShowsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VidsrcMoviesShowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
