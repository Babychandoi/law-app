package org.law_app.document.service;

import java.util.List;
import org.law_app.document.web.Dtos.ClauseRequest;
import org.law_app.document.web.Dtos.ClauseResponse;

public interface DocumentClauseService {
  ClauseResponse create(ClauseRequest request);

  ClauseResponse update(String id, ClauseRequest request);

  List<ClauseResponse> list(String query, String tag);

  ClauseResponse get(String id);

  ClauseResponse archive(String id);
}
