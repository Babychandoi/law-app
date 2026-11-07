package org.law_app.document.service;

import java.util.List;
import org.law_app.document.web.Dtos.FolderRequest;
import org.law_app.document.web.Dtos.FolderResponse;

public interface DocumentFolderService {
  List<FolderResponse> list();

  FolderResponse create(FolderRequest request);

  FolderResponse rename(String id, FolderRequest request);

  void delete(String id);
}
