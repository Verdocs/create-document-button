import { TestBed } from '@angular/core/testing';

import { CreateButtonService } from './create-button.service';

describe('CreateButtonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CreateButtonService = TestBed.get(CreateButtonService);
    expect(service).toBeTruthy();
  });
});
