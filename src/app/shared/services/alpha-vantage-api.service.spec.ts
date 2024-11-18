import { TestBed } from '@angular/core/testing';

import { AlphaVantageApiService } from './alpha-vantage-api.service';

describe('AlphaVantageApiService', () => {
  let service: AlphaVantageApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlphaVantageApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
