package com.example.demo.Controllers;


import com.example.demo.DTO.Borrow;
import com.example.demo.DTO.BorrowBookDTO;
import com.example.demo.Interfaces.FeignInterface;
import com.example.demo.Model.Books;
import com.example.demo.Repository.BooksRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.awt.print.Book;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collector;
import java.util.stream.Collectors;

@RestController
//@CrossOrigin("*")
public class FrontController {

    @Autowired
    private BooksRepo booksRepo;

    @Autowired
    private FeignInterface feignInterface;

    // ADDING NEW BOOKS
    @PostMapping("/addBook")
    public ResponseEntity<Books> addBook(@RequestBody Books book) {
        Books savedBook = booksRepo.save(book);
        return ResponseEntity.ok(savedBook);
    }

    // GETTING ALL THE BOOKS
    @GetMapping("/getBooks")
    public ResponseEntity<List<Books>> getAllBooks() {
        List<Books> books = booksRepo.findAll();
        return ResponseEntity.ok(books);
    }

    @GetMapping("/user/books")
    public ResponseEntity<List<Books>> getAllBooksByUser() {
        List<Books> books = booksRepo.findAll();
        return ResponseEntity.ok(books);
    }

    @PutMapping("/updateBook/{id}")
    public ResponseEntity<?> updateBook(@PathVariable Long id,
                                        @RequestBody Books books) {

        return booksRepo.findById(id)
                .map(existingBook -> {
                    existingBook.setName(books.getName());
                    existingBook.setStock(books.getStock());
                    existingBook.setTrend(books.getTrend());
                    existingBook.setWriter(books.getWriter());

                    booksRepo.save(existingBook);
                    return ResponseEntity.ok(existingBook);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/updatestock/dec/{id}")
    public ResponseEntity<?> decrement(@PathVariable("id") Long id){
        Optional<Books> b = booksRepo.findById(id).map(
                existingBook -> {
                    existingBook.setStock(existingBook.getStock() - 1);
                    return booksRepo.save(existingBook);
                }
        );
        return ResponseEntity.ok(b);
    }
    @PutMapping("/updatestock/incre/{id}")
    public ResponseEntity<?> increment(@PathVariable("id") Long id){
        Optional<Books> b = booksRepo.findById(id).map(
                existingBook -> {
                    existingBook.setStock(existingBook.getStock() + 1);
                    return booksRepo.save(existingBook);
                }
        );
        return ResponseEntity.ok(b);
    }

    @GetMapping("/getBooks/inStock")
    public ResponseEntity<List<Books>> getBooksInStock() {
        List<Books> books = booksRepo.findAll().stream()
                .filter(b -> b.getStock() > 0).toList();
        return ResponseEntity.ok(books);
    }


    @GetMapping("/getbor")
    public ResponseEntity<?> getall(){
        Map<Long, String> collect = booksRepo.findAll().stream()
                .collect(Collectors.toMap(Books::getId, Books::getName));
        List<BorrowBookDTO> l =  feignInterface.getAllBorrows()
                .getBody()
                .stream().map(b-> {
                    Books book = booksRepo.findById(b.getBookId()).get();
                    if(book != null){
                        return new BorrowBookDTO(
                               book.getId(),book.getName(),b.getMemberId()
                               ,b.getBorrowDate(),b.getReturnDate(),b.getId()
                        );
                    }else {
                        return null;
                    }
                }).filter(Objects::nonNull).collect(Collectors.toList());
        System.out.printf("calling");
        System.out.printf(l.toString());
        return ResponseEntity.ok(l);
    }
}
