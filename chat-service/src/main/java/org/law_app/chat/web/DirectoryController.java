package org.law_app.chat.web;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.law_app.chat.service.FileStorageService;
import org.law_app.chat.service.PresenceService;
import org.law_app.chat.service.StaffDirectoryService;
import org.law_app.chat.service.StaffDirectoryService.StaffUser;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class DirectoryController {

  private final StaffDirectoryService directoryService;
  private final FileStorageService fileStorageService;
  private final PresenceService presenceService;

  /** Staff directory, proxied from the monolith with the caller's token. */
  @GetMapping("/users")
  public ApiResponse<List<StaffUser>> users(
      @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
    String token = authorization.startsWith("Bearer ") ? authorization.substring(7) : authorization;
    return ApiResponse.ok(directoryService.listStaff(token));
  }

  /** Online userIds, for presence dots in the directory/inbox. */
  @GetMapping("/presence")
  public ApiResponse<List<String>> presence() {
    return ApiResponse.ok(List.copyOf(presenceService.onlineUsers()));
  }

  /** Upload an attachment to MinIO; returns the attachment metadata to embed in a message. */
  @PostMapping("/upload")
  public ApiResponse<FileStorageService.Attachment> upload(
      @RequestParam("file") MultipartFile file) {
    return ApiResponse.ok(fileStorageService.upload(file));
  }
}
